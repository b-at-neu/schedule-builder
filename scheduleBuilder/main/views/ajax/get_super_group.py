from django.http import JsonResponse
from main.models import CourseGroup

"""
Returns the group super to the one provided
"""
def get_super_group(filters):
    group = CourseGroup.objects.get(**filters)

    # Check if it is a top level group
    if group.row == 0:
        data = None
        
    else:
        super_group = CourseGroup.objects.filter(pk=group.group.pk).first()

        data = {
            "pk": super_group.pk,
            "column": super_group.column,
            "row": super_group.row
        }

    return JsonResponse({'data': data}, status=200)