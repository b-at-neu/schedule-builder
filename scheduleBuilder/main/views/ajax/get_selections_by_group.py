from django.http import JsonResponse
from main.models import CourseGroup, CourseSelection

"""
Recursive function to return the total amount of selected cells
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
Returns amount of cells selected per group based on optional criteria
"""
def get_selections_by_group(filters):
        
    # Get all model info
    selections = []
    for item in CourseGroup.objects.filter(**filters):
        # Get what semesters and how many courses are selected each
        selected_per_semester = {
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

        selections.append({
            "column": item.index,
            "row": item.row,
            "title": item.title,
            "count": item.count,
            "selected_per_semester": selected_per_semester
        })

    return JsonResponse({'data': selections}, status=200)
