import gzip
import os
import warnings

from django.core import serializers
from django.core.management.base import BaseCommand, CommandError
from taggit.models import TaggedItem, Tag

from adventure.models import Adventure, Room, RoomExit, Artifact, Effect, Monster, Hint, HintAnswer, Author

try:
    import bz2
    has_bz2 = True
except ImportError:
    has_bz2 = False

try:
    import lzma
    has_lzma = True
except ImportError:
    has_lzma = False


class ProxyModelWarning(Warning):
    pass


class Command(BaseCommand):
    """Database dump command, based on Django's built-in 'dumpdata' command.

    For the original version, see:
     https://github.com/django/django/blob/main/django/core/management/commands/dumpdata.py"""
    help = (
        "Output the data for an adventure."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            'adventure', nargs='?', type=int,
            help='Specifies the ID of the adventure to output.',
        )
        parser.add_argument(
            '--format', default='json',
            help='Specifies the output serialization format for fixtures.',
        )
        parser.add_argument(
            '-o', '--output',
            help='Specifies file to which the output is written.'
        )

    def handle(self, *app_labels, **options):
        adventure_id = options['adventure']
        format = options['format']
        output = options['output']
        if not output:
            adventure = Adventure.objects.get(pk=adventure_id)
            output = 'adventure/data/{:0>3}-{}.json'.format(adventure_id, adventure.slug)
        show_traceback = options['traceback']

        # Check that the serialization format exists; this is a shortcut to
        # avoid collating all the objects and _then_ failing.
        if format not in serializers.get_public_serializer_formats():
            try:
                serializers.get_serializer(format)
            except serializers.SerializerDoesNotExist:
                pass

            raise CommandError("Unknown serialization format: %s" % format)

        def get_objects(count_only=False):
            """
            Collate the objects to be serialized. If count_only is True, just
            count the number of objects to be serialized.
            """
            # TODO: support multiple adventures
            querysets = [
                Adventure.objects.filter(pk=adventure_id).prefetch_related('tags'),
                Tag.objects.filter(pk__in=TaggedItem.objects.filter(
                    content_type_id=7, object_id=adventure_id).values_list('tag_id')),
                TaggedItem.objects.filter(content_type_id=7, object_id=adventure_id),
                Author.objects.filter(adventure__id=adventure_id),
                Room.objects.filter(adventure_id=adventure_id),
                RoomExit.objects.filter(adventure_id=adventure_id),
                Artifact.objects.filter(adventure_id=adventure_id),
                Effect.objects.filter(adventure_id=adventure_id),
                Monster.objects.filter(adventure_id=adventure_id),
                Hint.objects.filter(adventure_id=adventure_id),
                HintAnswer.objects.filter(adventure_id=adventure_id),
            ]
            for queryset in querysets:
                if count_only:
                    yield queryset.order_by().count()
                else:
                    yield from queryset.iterator()

        try:
            self.stdout.ending = None
            progress_output = None
            object_count = 0
            # If dumpdata is outputting to stdout, there is no way to display progress
            if output and self.stdout.isatty() and options['verbosity'] > 0:
                progress_output = self.stdout
                object_count = sum(get_objects(count_only=True))
            if output:
                file_root, file_ext = os.path.splitext(output)
                compression_formats = {
                    '.bz2': (open, {}, file_root),
                    '.gz': (gzip.open, {}, output),
                    '.lzma': (open, {}, file_root),
                    '.xz': (open, {}, file_root),
                    '.zip': (open, {}, file_root),
                }
                if has_bz2:
                    compression_formats['.bz2'] = (bz2.open, {}, output)
                if has_lzma:
                    compression_formats['.lzma'] = (
                        lzma.open, {'format': lzma.FORMAT_ALONE}, output
                    )
                    compression_formats['.xz'] = (lzma.open, {}, output)
                try:
                    open_method, kwargs, file_path = compression_formats[file_ext]
                except KeyError:
                    open_method, kwargs, file_path = (open, {}, output)
                if file_path != output:
                    file_name = os.path.basename(file_path)
                    warnings.warn(
                        f"Unsupported file extension ({file_ext}). "
                        f"Fixtures saved in '{file_name}'.",
                        RuntimeWarning,
                    )
                stream = open_method(file_path, 'wt', **kwargs)
            else:
                stream = None
            try:
                serializers.serialize(
                    format, get_objects(), indent=2,
                    use_natural_foreign_keys=True,
                    use_natural_primary_keys=True,
                    stream=stream or self.stdout, progress_output=progress_output,
                    object_count=object_count,
                )
            finally:
                if stream:
                    stream.close()
        except Exception as e:
            if show_traceback:
                raise
            raise CommandError("Unable to serialize database: %s" % e)
