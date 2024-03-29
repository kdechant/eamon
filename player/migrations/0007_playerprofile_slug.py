# Generated by Django 3.2.6 on 2022-05-21 13:39

from django.db import migrations, models
from player.models import generate_slug


def populate_slug(apps, schema_editor):
    Player = apps.get_model('player', 'Player')
    PlayerProfile = apps.get_model('player', 'PlayerProfile')

    uuids = Player.objects.values_list('uuid', flat=True).distinct()
    for uuid in uuids:
        profile = PlayerProfile.objects.get_or_create(uuid=uuid)[0]
        print(repr(profile))
        slug = generate_slug()
        while PlayerProfile.objects.filter(slug=slug).exists():
            slug = generate_slug()
        profile.slug = slug
        profile.save()


class Migration(migrations.Migration):

    dependencies = [
        ('player', '0006_alter_savedgame_player'),
    ]

    operations = [
        migrations.AddField(
            model_name='playerprofile',
            name='slug',
            field=models.CharField(max_length=6, null=True),
        ),
        migrations.RunPython(populate_slug, migrations.RunPython.noop)
    ]
