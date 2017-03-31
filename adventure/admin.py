from django.contrib import admin

# Register your models here.
from .models import Adventure, Author


class AdventureAdmin(admin.ModelAdmin):
    list_display = ('name', 'author_list', 'edx', 'edx_version', 'active', 'tag_list')
    list_filter = ['edx', 'edx_version', 'authors', 'active']
    ordering = ['name']

    def get_queryset(self, request):
        return super(AdventureAdmin, self).get_queryset(request).prefetch_related('tags')

    def author_list(self, obj):
        return ", ".join(o.name for o in obj.authors.all())

    def tag_list(self, obj):
        return ", ".join(o.name for o in obj.tags.all())


class AuthorAdmin(admin.ModelAdmin):
    list_display = ('__str__',)


admin.site.register(Adventure, AdventureAdmin)
admin.site.register(Author, AuthorAdmin)
