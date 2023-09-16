from main.models import Course, CourseGroup

# Add a new program to database
def addProgram(program):

    # Returns the amount of courses in the provided obj
    def courseCount(obj):
        l = len(obj.get("courses"))
        for item in obj.get("courses"):
            if type(item) is not str:
                l += (courseCount(item) - 1)
        return l

    # Keep track of current index
    currentIndex = 0

    # Add the root group
    root = CourseGroup(
        index = currentIndex,
        title = program.get('title'),
        count = courseCount(program),
        required = program.get('count') or len(program.get('courses')),
        row = 0
    )
    root.save()

    # Begin recursive call
    def rec(obj, id, currentIndex, currentRow):
        # Iterate over every course or course group
        for item in obj.get('courses'):

            # Handle courses
            if type(item) is str:
                Course.objects.create(
                    index = currentIndex,
                    group_id = id,
                    code = item
                )

                # Move the index forwards
                currentIndex += 1

            # Handle groups
            else:
                group = CourseGroup(
                    index = currentIndex,
                    group_id = id,
                    title = item.get('title', ''),
                    count = courseCount(item),
                    required = item.get('count') or len(item.get('courses')),
                    row = currentRow
                )
                group.save()

                # Call recursive function with new group
                currentIndex = rec(item, group.pk, currentIndex, currentRow + 1)
        
        return currentIndex
    
    rec(program, root.pk, currentIndex, 1)