from django.db import models

# Create your models here.
class CourseBase(models.Model):
    index = models.PositiveSmallIntegerField()
    group = models.ForeignKey("CourseBase",on_delete=models.CASCADE,null=True)

class Course(CourseBase):
    code = models.CharField(max_length=8)

class CourseGroup(CourseBase):
    title = models.CharField(max_length=50)
    count = models.PositiveSmallIntegerField()