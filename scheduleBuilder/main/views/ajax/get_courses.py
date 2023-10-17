from django.http import JsonResponse
from main.models import Course

"""
Returns all group data
"""
def get_courses(filter):

    courses = []

    # Get data from every group
    for course in Course.objects.all():
        courses.append({
            "column": course.column,
            "code": course.code,
        })


    return JsonResponse({'data': courses}, status=200)