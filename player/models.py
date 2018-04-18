from django.db import models
from adventure.models import Adventure, Player


class SavedGame(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='saved_games')
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE, related_name='saved_games')
    slot = models.IntegerField(null=True)
    description = models.CharField(max_length=255, blank=True, default="")
    data = models.TextField(max_length=1000000, null=True)

    def __str__(self):
        return "Player {}, Adventure {}, Slot {}: {}".format(self.player_id, self.adventure_id, self.slot, self.description)
