from django.http import JsonResponse
from main.models import Course

"""
Returns all group data
"""
def get_setup_info(filter):

    context = {
        "course_count": Course.objects.count(),
        "year_count": 4,
        "semesters": ["Fall", "Spring", "Summer 1", "Summer 2"],
    }

    return JsonResponse({'data': context}, status=200)