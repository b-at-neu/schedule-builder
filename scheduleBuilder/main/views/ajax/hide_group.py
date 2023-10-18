from django.http import JsonResponse
from main.models import CourseGroup

"""
Marks a group as hidden or unhidden
"""
def hide_group(data):
    print(data)
    # Mark course
    CourseGroup.objects.filter(pk=data.get('pk')).update(hidden=data.get('hide'))

    return JsonResponse({'status': 'Success'}, status=200)