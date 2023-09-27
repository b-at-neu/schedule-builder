import requests, json
from django.shortcuts import render
from django.http import HttpResponseNotFound, JsonResponse, HttpResponseBadRequest
from main.services.add_program import addProgram
from main.models import Course, CourseGroup, CourseSelection

# Create your views here.
"""
Returns main page view
"""
def index(request):
    """
    searchTerm = "Fall 2023 Semester"
    
    # Get term code from search term
    try:
        term = requests.get(f'https://nubanner.neu.edu/StudentRegistrationSsb/ssb/classSearch/getTerms?offset=1&max=1&searchTerm={searchTerm}')
        term = term.json()[0].get('code')
    except:
        return HttpResponseNotFound('An API error occured.')
    
    # Get subject list
    try:
        subjects = requests.get(f'https://nubanner.neu.edu/StudentRegistrationSsb/ssb/classSearch/get_subject?term=202410&offset=1&max=1000')
    except:
        return HttpResponseNotFound('An API error occured')
    """

    with open('requirements/BSCS.json') as f:
        bscs_requirements = json.load(f)

    # addProgram(bscs_requirements)
    
    # Generate html for course groups in four rows
    groups_html = ["", "", "", ""]
    current_group_index = [0, 0, 0, 0]
    for group in CourseGroup.objects.order_by("index"):
        IS_LAST = not CourseGroup.objects.filter(group=group).count()

        # Check to add blank space
        while group.index is not current_group_index[group.row]:
            groups_html[group.row] += f'<td data-column="{current_group_index[group.row]}" data-row="{group.row}"></td>'
            current_group_index[group.row] += 1

        # Calculate added index due to rowspan
        if IS_LAST:
            for i in range(group.row + 1, 4):
                current_group_index[i] += group.count

        # Create html
        TITLE = 'title="Click to hide this group"'
        CLASSES = f'class="row{ group.row }"'
        COLSPAN = f'colspan="{ group.count }"'
        ROWSPAN = f'rowspan="{ 5 - group.row - 1 }"' if IS_LAST else ""
        DATA = f'data-column="{ group.index }" data-row="{ group.row }"'
        CHOOSE_TEXT = (" (choose " + str(group.required) + ")" ) if group.count else ""
        groups_html[group.row] += f'<th { TITLE } { CLASSES } { COLSPAN } { ROWSPAN } { DATA }>{ group.title }{ CHOOSE_TEXT }</th>'

        # Increment index
        current_group_index[group.row] += group.count

    # Generate html for courses
    courses_html = ""
    for course in Course.objects.all():
        courses_html += f'<td class="col{ course.index }">{ course }</td>'

    context = {
        "groups": groups_html,
        "courses": courses_html,
        "course_count": range(Course.objects.count()),
        "year_count": range(4),
        "semesters": ["Fall", "Spring", "Summer 1", "Summer 2"],
        "selected_courses": CourseSelection.objects.all()
    }

    return render(request, 'index.html', context)


"""
Returns current course selections with optional criteria
"""
def get_selections(request):
    # Check for ajax and get
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        if request.method == 'GET':
            # Create filter
            filters = {}

            # Check the query
            column = request.GET.get('col')
            if column:
                filters['course__index'] = column
            year = request.GET.get('year')
            if year:
                filters['year'] = int(year) + 1
            semester = request.GET.get('sem')
            if semester:
                filters['semester'] = semester
            
            # Get all model info
            selections = []
            for item in CourseSelection.objects.filter(**filters):
                selections.append({
                    "column": item.course.index,
                    "year": item.year - 1,
                    "semester": item.semester
                })

            return JsonResponse({'data': selections}, status=200)
        return JsonResponse({'status': 'Invalid request'}, status=400)
    return HttpResponseBadRequest()


"""
Returns groups based on optional criteria
"""
def get_groups(request):
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


    # Check for ajax and get
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        if request.method == 'GET':
            # Create filter
            filters = {}

            # Check the query
            column = request.GET.get('col')
            if column:
                filters['index'] = column
            row = request.GET.get('row')
            if row:
                filters['row'] = row
            
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
        return JsonResponse({'status': 'Invalid request'}, status=400)
    return HttpResponseBadRequest()


"""
Returns the group super to the one provided
"""
def get_super_group(request):
    # Check for ajax, get, and parameters
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        if request.method == 'GET' and request.GET.get('col') and request.GET.get('row'):
            
            super_group = CourseGroup.objects.get(pk=CourseGroup.objects.filter(index=request.GET.get('col')).get(row=request.GET.get('row')).group.pk)

            data = {
                "column": super_group.index,
                "row": super_group.row
            }

            return JsonResponse({'data': data}, status=200)
        return JsonResponse({'status': 'Invalid request'}, status=400)
    return HttpResponseBadRequest()

"""
Add course selection from POST request to models
"""
def add_course(request):
    # Check for ajax and post
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        if request.method == 'POST':

            data = json.load(request)

            # Find course
            course = Course.objects.filter(index=data.get('column')).first()

            # Create model object
            CourseSelection.objects.create(
                course = course,
                year = data.get('year') + 1,
                semester = data.get('semester')
            )

            return JsonResponse({'status': 'Success'}, status=200)
        return JsonResponse({'status': 'Invalid request'}, status=400)
    return HttpResponseBadRequest()


"""
Removes course selection from models
"""
def remove_course(request):
    # Check for ajax and post
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        if request.method == 'POST':
            
            data = json.load(request)

            # Find course
            course = Course.objects.filter(index=data.get('column')).first()

            # Delete selection
            CourseSelection.objects.filter(
                course = course,
                year = data.get('year') + 1,
                semester = data.get('semester')
            ).delete()

            return JsonResponse({'status': 'Success'}, status=200)
        return JsonResponse({'status': 'Invalid request'}, status=400)
    return HttpResponseBadRequest()


"""
Return view to add new program WIP
"""
def add_program_view(request):
    return render(request, 'add_program.html')