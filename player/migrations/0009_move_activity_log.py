# Generated by Django 3.2.12 on 2022-05-15 08:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('player', '0008_activitylog'),
    ]

    operations = [
        migrations.RunSQL('SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0'),

        migrations.RunSQL(
            'REPLACE INTO eamon.player_activitylog '
            '(id, `type`, value, created, adventure_id, player_id) '
            ' SELECT id, `type`, value, created, adventure_id, player_id '
            ' FROM adventure_activitylog'),

        migrations.RunSQL('SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS')
    ]
