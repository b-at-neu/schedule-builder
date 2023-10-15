from django.http import JsonResponse
from main.models import CourseSelection

"""
Removes all course selections from models
"""
def remove_all_courses(filters):
    CourseSelection.objects.all().delete()

    return JsonResponse({'status': 'Success'}, status=200)