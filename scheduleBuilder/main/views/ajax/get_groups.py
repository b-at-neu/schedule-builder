from django.http import JsonResponse
from main.models import CourseGroup

"""
Returns all group data
"""
def get_groups(filter):

    groups = []

    # Get data from every group
    for group in CourseGroup.objects.order_by("index"):
        groups.append({
            "index": group.index,
            "row": group.row,
            "count": group.count,
            "required": group.required,
            "title": group.title,
            "is_last": not CourseGroup.objects.filter(group=group).count()
        })

    return JsonResponse({'data': groups}, status=200)