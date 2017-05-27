from django.db import models
from ckeditor.fields import RichTextField


class Article(models.Model):
    title = models.CharField(max_length=255)
    body = RichTextField()
    created_at = models.DateField()

    def __str__(self):
        return self.title
