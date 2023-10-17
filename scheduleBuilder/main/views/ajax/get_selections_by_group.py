from django.http import JsonResponse
from main.models import CourseGroup, CourseSelection

"""
Recursive function to return the amount of selected cells by semester
"""
def get_selected_per_semester(group, selected_per_semester):
    
    # Add count of courses per semester
    for course in CourseSelection.objects.filter(course__group=group):
        selected_per_semester[f'{course.year}'][course.semester] += 1

    # Check if group contains subgroups
    for subgroup in CourseGroup.objects.filter(group=group):
        get_selected_per_semester(subgroup, selected_per_semester)

    return selected_per_semester

"""
Recursive function to return the total amount of selected cells
"""
def get_selected_total(group, selected_total):
    
    # Add count of all courses
    selected_total += CourseSelection.objects.filter(course__group=group).count()

    # Check if group contains subgroups
    for subgroup in CourseGroup.objects.filter(group=group):
        selected_total = get_selected_total(subgroup, selected_total)

    return selected_total


"""
Returns amount of cells selected per group based on optional criteria
"""
def get_selections_by_group(filters):
        
    # Get all model info
    selections = []
    for item in CourseGroup.objects.filter(**filters):
        # Get what semesters and how many courses are selected each
        selected_per_semester = {
            "0": {
                "Credit": 0,
            },
            "1": {
                "Fall": 0,
                "Spring": 0,
                "Summer 1": 0,
                "Summer 2": 0,
            },
            "2": {
                "Fall": 0,
                "Spring": 0,
                "Summer 1": 0,
                "Summer 2": 0,
            },
            "3": {
                "Fall": 0,
                "Spring": 0,
                "Summer 1": 0,
                "Summer 2": 0,
            },
            "4": {
                "Fall": 0,
                "Spring": 0,
                "Summer 1": 0,
                "Summer 2": 0,
            }
        }
        selected_per_semester = get_selected_per_semester(item, selected_per_semester)
        selected_total = get_selected_total(item, 0)

        selections.append({
            "pk": item.pk,
            "column": item.column,
            "row": item.row,
            "title": item.title,
            "count": item.count,
            "selected_per_semester": selected_per_semester,
            "selected_total": selected_total,
        })

    return JsonResponse({'data': selections}, status=200)
