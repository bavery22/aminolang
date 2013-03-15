class EventSingleton {
public:
    virtual void touchStart(float x, float y, unsigned int tap_count=0) { }
    virtual ~EventSingleton() {}
};

extern void enable_touch(uint32_t adisplay_w, uint32_t adisplay_h);
extern void event_process(void);
extern size_t event_indication;
extern EventSingleton *eventSingleton;
