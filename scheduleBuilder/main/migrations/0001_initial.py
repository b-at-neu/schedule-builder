# Generated by Django 4.2.5 on 2023-09-14 21:40

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CourseBase',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('index', models.PositiveSmallIntegerField()),
                ('group', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='main.coursebase')),
            ],
        ),
        migrations.CreateModel(
            name='Course',
            fields=[
                ('coursebase_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='main.coursebase')),
                ('code', models.CharField(max_length=8)),
            ],
            bases=('main.coursebase',),
        ),
        migrations.CreateModel(
            name='CourseGroup',
            fields=[
                ('coursebase_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='main.coursebase')),
                ('title', models.CharField(max_length=50)),
                ('count', models.PositiveSmallIntegerField()),
            ],
            bases=('main.coursebase',),
        ),
    ]
