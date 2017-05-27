from django.shortcuts import render
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from .models import Article


def news(request):
    article_list = Article.objects.order_by('-created_at')
    page = request.GET.get('page', 1)
    paginator = Paginator(article_list, 3)

    try:
        articles = paginator.page(page)
    except PageNotAnInteger:
        articles = paginator.page(1)
    except EmptyPage:
        articles = paginator.page(paginator.num_pages)

    return render(request, 'news.html', {'articles': articles})
