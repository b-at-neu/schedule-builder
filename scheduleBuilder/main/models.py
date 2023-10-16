from django.db import models

# Create your models here.
class CourseBase(models.Model):
    index = models.PositiveSmallIntegerField()
    group = models.ForeignKey("CourseBase", on_delete=models.CASCADE, null=True)

# Represents one course
class Course(CourseBase):
    code = models.CharField(max_length=8)

    def __str__(self) -> str:
        return self.code

# Represents one group of courses
class CourseGroup(CourseBase):
    title = models.CharField(max_length=50)
    count = models.PositiveSmallIntegerField()
    required = models.PositiveSmallIntegerField()
    row = models.PositiveSmallIntegerField()

    def __str__(self) -> str:
        return self.title

# Represents one selection of a course
class CourseSelection(models.Model):
    class Semester(models.TextChoices):
        FALL = "FL", "Fall"
        SPRING = "SP", "Spring"
        SUMMER1 = "S1", "Summer 1"
        SUMMER2 = "S2", "Summer 2"
        CREDIT = "CR", "Credit"

    course = models.ForeignKey("Course", on_delete=models.CASCADE)
    year = models.PositiveSmallIntegerField()
    semester = models.CharField(max_length=2, choices=Semester.choices)

    def __str__(self) -> str:
        return self.course.code + " in year " + str(self.year) + " " + self.semester 