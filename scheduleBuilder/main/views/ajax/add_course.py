from django.http import JsonResponse
from main.models import Course, CourseSelection

"""
Add course selection from POST request to models
"""
def add_course(data):
    # Find course
    course = Course.objects.filter(index=data.get('column')).first()

    # Create model object
    CourseSelection.objects.create(
        course = course,
        year = data.get('year') + 1,
        semester = data.get('semester')
    )

    return JsonResponse({'status': 'Success'}, status=200)