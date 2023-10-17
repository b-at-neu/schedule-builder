from django.http import JsonResponse
from main.models import Course, CourseSelection

"""
Removes course selection from models
"""
def remove_course(data):
    # Find course
    course = Course.objects.filter(column=data.get('column')).first()

    # Delete selection
    CourseSelection.objects.filter(
        course = course,
        year = data.get('year'),
        semester = data.get('semester')
    ).delete()

    return JsonResponse({'status': 'Success'}, status=200)