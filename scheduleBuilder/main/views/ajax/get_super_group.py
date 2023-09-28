from django.http import JsonResponse
from main.models import CourseGroup

"""
Returns the group super to the one provided
"""
def get_super_group(filters):
    group = CourseGroup.objects.get(**filters)
    super_group = CourseGroup.objects.get(pk=group.group.pk)

    data = {
        "column": super_group.index,
        "row": super_group.row
    }

    return JsonResponse({'data': data}, status=200)