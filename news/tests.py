from django.test import TestCase
from django.urls import reverse
from .models import Article


class ModelsTest(TestCase):
    def setUp(self):
        Article.objects.create(id=1, title="Clone army invades west coast",
                               created_at="2019-01-01")

    def test_object(self):
        a1 = Article.objects.get(pk=1)
        self.assertEqual(str(a1), "Clone army invades west coast")


class ViewTests(TestCase):

    def test_news(self):
        Article.objects.create(id=1, title="Clone army invades west coast", body="Lorem ipsum...",
                               created_at="2019-01-01")
        Article.objects.create(id=2, title="Pirates spotted in Eamon Harbor", body="more text here",
                               created_at="2019-01-01")
        response = self.client.get(reverse('news'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Clone army invades west coast")
        self.assertContains(response, "Lorem ipsum")
        self.assertContains(response, "Pirates spotted in Eamon Harbor")
        self.assertContains(response, "more text here")
