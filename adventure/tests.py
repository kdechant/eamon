from django.test import TestCase
from django.urls import reverse
from .models import Adventure, ActivityLog, Room


class AdventureTest(TestCase):
    def setUp(self):
        Adventure.objects.create(id=1, name="Test Adventure")
        Adventure.objects.create(id=2, name="Test Adventure 2")
        ActivityLog.objects.create(adventure_id=1, type="start adventure")
        ActivityLog.objects.create(adventure_id=1, type="start adventure")
        ActivityLog.objects.create(adventure_id=2, type="start adventure")

    def test_object(self):
        a1 = Adventure.objects.get(pk=1)
        self.assertEqual(str(a1), "Test Adventure")
        self.assertEqual(a1.times_played, 2)

        a2 = Adventure.objects.get(pk=2)
        self.assertEqual(str(a2), "Test Adventure 2")
        self.assertEqual(a2.times_played, 1)


class RoomTest(TestCase):
    def setUp(self):
        Adventure.objects.create(id=1, name="Test Adventure")
        Room.objects.create(id=1, adventure_id=1, name="at the entrance")

    def test_object(self):
        r = Room.objects.get(pk=1)
        self.assertEqual(str(r), "at the entrance")


class ViewTests(TestCase):
    # Note: if this errors, run `python manage.py collectstatic`
    def test_index(self):
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Enter the Main Hall')

    def test_adventure_list(self):
        # note: avoid punctuation like apostrophes in the data, because it gets html-entitied in the response
        a1 = Adventure.objects.create(id=1, name="Beginners Cave", description="xyzzy foo bar baz", active=True)
        a2 = Adventure.objects.create(id=2, name="Second Adventure", description="snorq blorq", active=False)
        response = self.client.get(reverse('adventure-list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, a1.name)
        self.assertContains(response, a1.description)
        self.assertNotContains(response, a2.name)
        self.assertNotContains(response, a2.description)
