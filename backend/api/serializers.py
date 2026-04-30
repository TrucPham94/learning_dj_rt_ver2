from rest_framework import serializers
from .models import Product, TestModel, Test2

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class TestModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestModel
        fields = '__all__'

class Test2Serializer(serializers.ModelSerializer):
    class Meta:
        model = Test2
        fields = '__all__'
        