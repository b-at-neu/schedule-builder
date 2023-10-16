from main.models import Course, CourseGroup

# Add a new program to database
def addProgram(program):

    # Returns the amount of courses in the provided obj
    def course_count(obj):
        l = len(obj.get("courses"))
        for item in obj.get("courses"):
            if type(item) is not str:
                l += (course_count(item) - 1)
        return l
    
    # Returns the amount of required courses in the provided obj
    def required_course_count(obj):
        count = obj.get('count')
        if (count):
            return count
        count = len(obj.get("courses"))
        for item in obj.get("courses"):
            if type(item) is not str:
                count += (required_course_count(item) - 1)
        return count

    # Keep track of current index
    currentIndex = 0

    # Add the root group
    root = CourseGroup(
        index = currentIndex,
        title = program.get('title'),
        count = course_count(program),
        required = required_course_count(program),
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
                    count = course_count(item),
                    required = required_course_count(item),
                    row = currentRow
                )
                group.save()

                # Call recursive function with new group
                currentIndex = rec(item, group.pk, currentIndex, currentRow + 1)
        
        return currentIndex
    
    rec(program, root.pk, currentIndex, 1)