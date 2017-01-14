from django.contrib import admin

# Register your models here.
from .models import Adventure


class AdventureAdmin(admin.ModelAdmin):
    list_display = ('name', 'edx', 'edx_version', 'active', 'tag_list')
    list_filter = ['edx', 'edx_version', 'active']
    ordering = ['name']

    def get_queryset(self, request):
        return super(AdventureAdmin, self).get_queryset(request).prefetch_related('tags')

    def tag_list(self, obj):
        return ", ".join(o.name for o in obj.tags.all())


admin.site.register(Adventure, AdventureAdmin)
