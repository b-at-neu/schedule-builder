from django.shortcuts import render

"""
Return view to add new program WIP
"""
def add_program_view(request):
    return render(request, 'add_program.html')