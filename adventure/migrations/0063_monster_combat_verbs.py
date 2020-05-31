# Generated by Django 3.0.5 on 2020-05-29 08:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('adventure', '0062_auto_20200501_0144'),
    ]

    operations = [
        migrations.AddField(
            model_name='monster',
            name='combat_verbs',
            field=models.CharField(blank=True, max_length=255, help_text="Custom combat verbs for this monster, e.g., 'stings' or 'breathes fire at'. Leave blank to use the standard verbs.", null=True),
        ),
    ]