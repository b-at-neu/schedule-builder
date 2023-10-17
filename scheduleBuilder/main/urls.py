from django.urls import path

from . import views

# Define a shortcut ajax path
def ajax_path(name, type, parameters=[], optional_parameters=[]):
    return path(
        f'ajax/{name.replace("_","")}',
        views.ajax_handler,
        {
            'name': name,
            'type': type,
            'parameters': parameters,
            'optional_parameters': optional_parameters
        }
    )


urlpatterns = [
    path("", views.index,),
    path("addprogram", views.add_program_view),

    # AJAX
    ajax_path('get_selections', 'GET', optional_parameters=['course__column', 'year', 'semester']),
    ajax_path('get_selections_by_group', 'GET', optional_parameters=['pk']),
    ajax_path('get_super_group', 'GET', parameters=['pk']),
    ajax_path('get_sub_groups', 'GET', parameters=['pk']),
    ajax_path('get_groups', 'GET', optional_parameters=['pk']),
    ajax_path('get_courses', 'GET'),
    ajax_path('get_setup_info', 'GET'),
    ajax_path('remove_all_courses', 'GET'),

    ajax_path('add_course', 'POST'),
    ajax_path('remove_course', 'POST'),
]