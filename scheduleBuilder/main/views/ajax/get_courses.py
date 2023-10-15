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
            "index": course.index,
            "code": course.code,
        })


    return JsonResponse({'data': courses}, status=200)