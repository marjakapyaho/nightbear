#include <pebble.h>

static Window *window;
static TextLayer *text_layer;

const int MESSAGE_TIMEOUT = 3000;

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  window_set_background_color(window, GColorWhite);

  text_layer = text_layer_create(GRect(0, 60, bounds.size.w, 34));
  text_layer_set_text(text_layer, "Loading");
  text_layer_set_background_color(text_layer, GColorWhite);
  text_layer_set_text_alignment(text_layer, GTextAlignmentCenter);
  text_layer_set_font(text_layer, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
  layer_add_child(window_layer, text_layer_get_layer(text_layer));
}

static void window_unload(Window *window) {
  text_layer_destroy(text_layer);
}

static void close_window(Window *window) {
  window_stack_remove(window, false);
}

static void exitApp() {
  app_timer_register(MESSAGE_TIMEOUT, (AppTimerCallback) close_window, window);
}

static void acknowledge_alarm() {

  // Declare the dictionary's iterator
  DictionaryIterator *out_iter;

  // Prepare the outbox buffer for this message
  AppMessageResult result = app_message_outbox_begin(&out_iter);

  if (result == APP_MSG_OK) {

    // Add an item
    int value = 1;
    dict_write_int(out_iter, MESSAGE_KEY_ACK_ALARM, &value, sizeof(int), true);
    result = app_message_outbox_send();

    if (result != APP_MSG_OK) {
      APP_LOG(APP_LOG_LEVEL_ERROR, "Error sending the outbox: %d", (int)result);
    }

  } else {
    // The outbox cannot be used right now
    APP_LOG(APP_LOG_LEVEL_ERROR, "Error preparing the outbox: %d", (int)result);
  }
}

static void inbox_received_callback(DictionaryIterator *iter, void *context) {
  Tuple *alarm_found_tuple = dict_find(iter, MESSAGE_KEY_ALARM_FOUND);
  Tuple *alarm_type_tuple = dict_find(iter, MESSAGE_KEY_ALARM_TYPE);
  Tuple *alarm_level_tuple = dict_find(iter, MESSAGE_KEY_ALARM_LEVEL);
  Tuple *ack_success_tuple = dict_find(iter, MESSAGE_KEY_ACK_SUCCESS);
  Tuple *api_error_tuple = dict_find(iter, MESSAGE_KEY_API_ERROR);

  if (api_error_tuple) {
    char *api_error = api_error_tuple->value->cstring;
    static char s_buffer[256];
    snprintf(s_buffer, sizeof(s_buffer), "%s", api_error);
    text_layer_set_text(text_layer, s_buffer);
    window_set_background_color(window, GColorRed);
    text_layer_set_background_color(text_layer, GColorRed);
    text_layer_set_text_color(text_layer, GColorWhite);
  }
  else if (alarm_found_tuple && alarm_type_tuple && alarm_level_tuple) {
    char *alarm_type = alarm_type_tuple->value->cstring;
    char *alarm_level = alarm_level_tuple->value->cstring;

    static char s_buffer[256];
    snprintf(s_buffer, sizeof(s_buffer), "%s, %s", alarm_type, alarm_level);
    text_layer_set_text(text_layer, s_buffer);
    window_set_background_color(window, GColorRed);
    text_layer_set_background_color(text_layer, GColorRed);
    text_layer_set_text_color(text_layer, GColorWhite);

    // Auto-ack alarm after X seconds
    app_timer_register(MESSAGE_TIMEOUT, (AppTimerCallback) acknowledge_alarm, NULL);
  }
  else if (ack_success_tuple) {
    exitApp();
  }
  else {
    text_layer_set_text(text_layer, "No alarms");
    window_set_background_color(window, GColorIslamicGreen);
    text_layer_set_background_color(text_layer, GColorIslamicGreen);
    text_layer_set_text_color(text_layer, GColorWhite);
    exitApp();
  }
}

static void outbox_sent_callback(DictionaryIterator *iter, void *context) {
  text_layer_set_text(text_layer, "Clearing");
}

static void init(void) {
  app_message_register_inbox_received(inbox_received_callback);
  app_message_register_outbox_sent(outbox_sent_callback);
  app_message_open(256, 256);
  window = window_create();
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  window_stack_push(window, false); // true for animated
}

static void deinit(void) {
  window_destroy(window);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}
