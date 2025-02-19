from django.http import JsonResponse
from main.models import CourseGroup

"""
Returns all group data
"""
def get_groups(filter):

    groups = []

    # Get data from every group
    for group in CourseGroup.objects.filter(**filter).order_by("column"):
        groups.append({
            "pk": group.pk,
            "column": group.column,
            "row": group.row,
            "count": group.count,
            "required": group.required,
            "title": group.title,
            "is_last": not CourseGroup.objects.filter(group=group).count(),
            "hidden": group.hidden,
        })

    return JsonResponse({'data': groups}, status=200)