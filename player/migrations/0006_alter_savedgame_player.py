# Generated by Django 3.2.12 on 2022-05-15 08:52

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('player', '0005_move_player_data'),
    ]

    operations = [
        migrations.AlterField(
            model_name='savedgame',
            name='player',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_games', to='player.player'),
        ),
    ]
