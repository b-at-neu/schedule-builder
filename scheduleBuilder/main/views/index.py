from django.shortcuts import render
import json
from main.services.add_program import addProgram

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

    """
    with open('requirements/BSCS.json') as f:
        bscs_requirements = json.load(f)

    addProgram(bscs_requirements)
    """

    return render(request, 'index.html')