from django.http import JsonResponse
from main.models import CourseGroup

"""
Recursive function to get all sub groups
"""
def list_sub_groups(group, list):
    sub_groups = CourseGroup.objects.filter(group_id=group.pk)
    list += sub_groups

    # Get sub groups of sub groups
    for sub_group in sub_groups:
        list_sub_groups(sub_group, list)

    return list

"""
Returns all groups that are sub to the one provided
"""
def get_sub_groups(filters):
    group = CourseGroup.objects.get(**filters)

    data = []

    for sub_group in list_sub_groups(group, []):
        data.append({
            "pk": sub_group.pk
        })

    return JsonResponse({'data': data}, status=200)