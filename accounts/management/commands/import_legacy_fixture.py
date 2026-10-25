from django.contrib.auth.models import User
from django.core.management import BaseCommand, call_command
from django.db.models.signals import post_save

from accounts.signals import create_user_profile, save_user_profile


class Command(BaseCommand):
    help = "Load a dumpdata fixture without auto-creating duplicate user profiles."

    def add_arguments(self, parser):
        parser.add_argument("fixture", help="Path to a dumpdata JSON fixture")

    def handle(self, *args, **options):
        post_save.disconnect(create_user_profile, sender=User)
        post_save.disconnect(save_user_profile, sender=User)
        try:
            call_command("loaddata", options["fixture"])
        finally:
            post_save.connect(create_user_profile, sender=User)
            post_save.connect(save_user_profile, sender=User)
