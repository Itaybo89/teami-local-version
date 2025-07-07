import asyncio
from utils.console_log import log_console
from debug_flags import debug_retry as debug # Controls verbose logging for this module.

async def sleep_interval(seconds: float = 2.0) -> None:
    """
    Asynchronously pauses execution for a specified duration, logging sleep and wake events.

    Args:
        seconds (float, optional): The duration in seconds to sleep. Defaults to 2.0.
    """
    log_console(f"⏳ Sleeping for {seconds} seconds...", debug_flag=debug)
    await asyncio.sleep(seconds)
    log_console("⏰ Woke up, continuing loop.", debug_flag=debug)