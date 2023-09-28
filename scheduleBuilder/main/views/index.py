import json
from django.shortcuts import render
from main.services.add_program import addProgram
from main.models import Course, CourseGroup, CourseSelection

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