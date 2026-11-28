from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    username = None  
    email = models.EmailField('Электронная почта', unique=True)
    name = models.CharField('Никнейм', max_length=24)
    avatar = models.TextField(blank=True, null=True)
    bio = models.TextField('О себе', max_length=160, blank=True, default='')
    language = models.CharField(
        'Язык', max_length=8, choices=[('ru', 'Русский'), ('en', 'English')], default='ru'
    )
    header_blur = models.IntegerField('Размытие панели', default=12)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def to_public_dict(self):
        return {
            'name': self.name,
            'email': self.email,
            'avatar': self.avatar,
            'headerBlur': self.header_blur,
            'bio': self.bio,
            'language': self.language,
        }

    def __str__(self):
        return self.name or self.email
