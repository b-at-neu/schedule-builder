from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("addprogram", views.add_program_view, name="add program")
]