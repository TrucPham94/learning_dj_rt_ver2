from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, TestModelViewSet, Test2ViewSet

router = DefaultRouter()

router.register(r'products', ProductViewSet)

router.register(r'test-models', TestModelViewSet)

router.register(r'test2', Test2ViewSet)

urlpatterns = [
    path('', include(router.urls)),
]