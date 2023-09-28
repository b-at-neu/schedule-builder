from django.http import JsonResponse
from main.models import CourseSelection

"""
Returns current course selections with optional criteria
"""
def get_selections(filters):
    # Get all model info
    selections = []
    for item in CourseSelection.objects.filter(**filters):
        selections.append({
            "column": item.course.index,
            "year": item.year - 1,
            "semester": item.semester
        })

    return JsonResponse({'data': selections}, status=200)