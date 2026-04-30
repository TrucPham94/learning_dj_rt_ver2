from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, TestModelViewSet

router = DefaultRouter()

router.register(r'products', ProductViewSet)

router.register(r'test-models', TestModelViewSet)

urlpatterns = [
    path('', include(router.urls)),
]