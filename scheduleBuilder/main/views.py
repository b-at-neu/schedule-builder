import requests, json
from django.shortcuts import render
from django.http import HttpResponseNotFound
from main.services.add_program import addProgram
from main.models import Course, CourseGroup

# Create your views here.
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
    

    
    # Get BSCS program reqs from file
    with open('requirements/BSCS.json') as f:
        bscs_requirements = json.load(f)
    with open('requirements/MinorTheatre.json') as f:
        mith_requirements = json.load(f)

    # Recursion function calculate amount of courses under a specific object
    def courseCount(obj):
            l = len(obj.get("courses"))
            for item in obj.get("courses"):
                if type(item) is not str:
                    l += (courseCount(item) - 1)
            return l

    # Adds all the program required courses to html
    def addProgram(rows, o, currentRow=0, currentColumn=0):
        
        def isEndLevel(obj):
            for item in obj.get("courses"):
                if type(item) is not str:
                    return False
            return True

        # Add title to section and move down row
        rowspan = f'rowspan="{ 5 - currentRow - 1 }"'
        rows[currentRow] += f'<th class="hc{ currentColumn }" { rowspan if isEndLevel(o) else "" } colspan="{ courseCount(o) }">{ o.get("title") or "" }{ (" (choose " + str(o.get("count")) + ")" ) if o.get("count") else "" }</th>'
        if currentRow == 1:
            currentColumn += 1
        currentRow += 1

        for item in o.get('courses'):

            # Write direct html for course names
            if type(item) is str:
                # Grab class API data

                rows[4] += f'<td>{ item }</td>'

                # Add blank spaces for remaining rows
                if not isEndLevel(o):
                    for j in range(5 - currentRow - 1):
                        rows[currentRow + j] += "<td></td>"

            # Recurse for objects
            else:
                rows = addProgram(rows, item, currentRow, currentColumn)

        return rows

    # Generate html code
    rows = addProgram([
            '<tr class="row1"><td><td>',
            '<tr class="row2"><td><td>',
            '<tr class="row3"><td><td>',
            '<tr class="row4"><td><td>',
            '<tr class="row5"><td><td>'
        ], bscs_requirements)
    rows = addProgram(rows, mith_requirements)

    context = {
        'html': ("</tr>".join(rows) + "</tr>"),
        'courseCount': range(courseCount(bscs_requirements) + courseCount(mith_requirements))
    }"""

    with open('requirements/BSCS.json') as f:
        bscs_requirements = json.load(f)

    #addProgram(bscs_requirements)
    
    # Read data from model
    def generateProgramHtml(rows, currentRow=0, currentColumn=0):
        
        # Check if the course is on the lowest level
        def isEndLevel(obj):
            for item in obj.get("courses"):
                if type(item) is not str:
                    return False
            return True

        # Add title to section and move down row
        rowspan = f'rowspan="{ 5 - currentRow - 1 }"'
        rows[currentRow] += f'<th class="hc{ currentColumn }" { rowspan if isEndLevel(o) else "" } colspan="{ courseCount(o) }">{ o.get("title") or "" }{ (" (choose " + str(o.get("count")) + ")" ) if o.get("count") else "" }</th>'
        if currentRow == 1:
            currentColumn += 1
        currentRow += 1

        for item in o.get('courses'):

            # Write direct html for course names
            if type(item) is str:
                # Grab class API data

                rows[4] += f'<td>{ item }</td>'

                # Add blank spaces for remaining rows
                if not isEndLevel(o):
                    for j in range(5 - currentRow - 1):
                        rows[currentRow + j] += "<td></td>"

            # Recurse for objects
            else:
                rows = addProgram(rows, item, currentRow, currentColumn)

        return rows

    return render(request, 'index.html')

def add_program_view(request):
    return render(request, 'add_program.html')