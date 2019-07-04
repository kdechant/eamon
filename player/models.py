from django.db import models
from adventure.models import Adventure, Player


class SavedGame(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='saved_games')
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE, related_name='saved_games')
    slot = models.IntegerField(null=True)
    description = models.CharField(max_length=255, blank=True, default="")
    data = models.TextField(max_length=1000000, null=True)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return "Player {}, Adventure {}, Slot {}: {}".format(self.player_id, self.adventure_id, self.slot, self.description)


class Rating(models.Model):
    uuid = models.CharField(max_length=255, null=True)
    adventure = models.ForeignKey(Adventure, on_delete=models.CASCADE, related_name='ratings')
    overall = models.IntegerField(null=True, blank=True)
    combat = models.IntegerField(null=True, blank=True)
    puzzle = models.IntegerField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True, null=True)
