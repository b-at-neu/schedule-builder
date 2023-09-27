from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("addprogram", views.add_program_view, name="add program"),

    path("ajax/getselections", views.get_selections, name="get selections"),
    path("ajax/getgroups", views.get_groups, name="get groups"),
    path("ajax/getsupergroup", views.get_super_group, name="get super group"),
    path("ajax/addcourse", views.add_course, name="add course"),
    path("ajax/removecourse", views.remove_course, name="remove course"),
]