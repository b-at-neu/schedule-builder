import json
from . import ajax
from django.http import HttpResponseBadRequest, JsonResponse, HttpResponseServerError

"""
Handle all ajax requests
"""
def ajax_handler(request, name, type, parameters, optional_parameters):

    # Check for proper auth
    if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return HttpResponseBadRequest()

    # Check if type matches
    if (type == 'GET' and not request.method == 'GET'):
        return JsonResponse({'status': 'Invalid request. Expected GET method.'}, status=400)
    
    if (type == 'POST' and not request.method == 'POST'):
        return JsonResponse({'status': 'Invalid request. Expected POST method.'}, status=400)
    
    filters = {}

    if type == 'GET':
        # Handle required parameters
        for p in parameters:
            filters[p] = request.GET.get(p)
            if filters[p] is None:
                return JsonResponse({'status': f'Invalid request. Parameter "{p}" not found.'}, status=400)

        for p in optional_parameters:
            if request.GET.get(p) is not None:
                filters[p] = request.GET.get(p)

    # Retrieve the function
    func = getattr(ajax, name)

    if func is None:
        return HttpResponseServerError(f'{name} was not found to be a function.')

    # Call the function
    if type == 'GET':
        return func(filters)
    if type == 'POST':
        return func(json.load(request))
    
    return HttpResponseServerError("Incorrect type")