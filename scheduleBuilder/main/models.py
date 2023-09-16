from django.db import models

# Create your models here.
class CourseBase(models.Model):
    index = models.PositiveSmallIntegerField()
    group = models.ForeignKey("CourseBase",on_delete=models.CASCADE,null=True)

class Course(CourseBase):
    code = models.CharField(max_length=8)

    def __str__(self) -> str:
        return self.code

class CourseGroup(CourseBase):
    title = models.CharField(max_length=50)
    count = models.PositiveSmallIntegerField()
    required = models.PositiveSmallIntegerField()
    row = models.PositiveSmallIntegerField()

    def __str__(self) -> str:
        return self.title