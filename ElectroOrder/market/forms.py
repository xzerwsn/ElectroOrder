from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import User
from .models import MarketProfile


class MarketAuthenticationForm(AuthenticationForm):
    username = forms.CharField(
        label="Логин",
        widget=forms.TextInput(attrs={"placeholder": "Введите логин"}),
    )
    password = forms.CharField(
        label="Пароль",
        widget=forms.PasswordInput(attrs={"placeholder": "Введите пароль"}),
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({"class": "auth-input"})


class MarketRegistrationForm(UserCreationForm):
    first_name = forms.CharField(label="Имя", max_length=150)
    last_name = forms.CharField(label="Фамилия", max_length=150, required=False)
    email = forms.EmailField(label="Email")

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email", "password1", "password2")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        placeholders = {
            "username": "Придумайте логин",
            "first_name": "Иван",
            "last_name": "Петров",
            "email": "you@example.com",
            "password1": "Минимум 8 символов",
            "password2": "Повторите пароль",
        }
        labels = {
            "username": "Логин",
            "password1": "Пароль",
            "password2": "Подтверждение пароля",
        }

        for name, field in self.fields.items():
            field.widget.attrs.update({"class": "auth-input", "placeholder": placeholders.get(name, field.label)})
            if name in labels:
                field.label = labels[name]

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("Пользователь с таким email уже существует.")
        return email


class MarketProfileForm(forms.ModelForm):
    first_name = forms.CharField(label="Имя", max_length=150)
    last_name = forms.CharField(label="Фамилия", max_length=150, required=False)
    email = forms.EmailField(label="Email")

    class Meta:
        model = MarketProfile
        fields = ("first_name", "last_name", "email", "phone", "city", "delivery_address")
        widgets = {
            "phone": forms.TextInput(attrs={"class": "auth-input", "placeholder": "+7 999 123-45-67"}),
            "city": forms.TextInput(attrs={"class": "auth-input", "placeholder": "Москва"}),
            "delivery_address": forms.Textarea(
                attrs={"class": "auth-input auth-input--textarea", "placeholder": "Улица, дом, квартира", "rows": 4}
            ),
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop("user")
        super().__init__(*args, **kwargs)
        self.user = user
        self.fields["first_name"].initial = user.first_name
        self.fields["last_name"].initial = user.last_name
        self.fields["email"].initial = user.email
        self.fields["first_name"].widget.attrs.update({"class": "auth-input", "placeholder": "Имя"})
        self.fields["last_name"].widget.attrs.update({"class": "auth-input", "placeholder": "Фамилия"})
        self.fields["email"].widget.attrs.update({"class": "auth-input", "placeholder": "you@example.com"})

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if User.objects.filter(email__iexact=email).exclude(pk=self.user.pk).exists():
            raise forms.ValidationError("Этот email уже используется другим пользователем.")
        return email

    def save(self, commit=True):
        profile = super().save(commit=False)
        self.user.first_name = self.cleaned_data["first_name"]
        self.user.last_name = self.cleaned_data["last_name"]
        self.user.email = self.cleaned_data["email"]
        if commit:
            self.user.save(update_fields=["first_name", "last_name", "email"])
            profile.user = self.user
            profile.save()
        return profile
