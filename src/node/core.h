#include <ui/DisplayInfo.h>
#include <ui/FramebufferNativeWindow.h>
#include <gui/SurfaceComposerClient.h>
#include <math.h>
#include <node.h>
#include <stack>
#include <string>
#include "common.h"
#include "shaders.h"


using namespace v8;

static GLfloat* modelView;
static ColorShader* colorShader;
static FontShader* fontShader;

class GLGFX : public node::ObjectWrap {
public:
    static void dumpValue(Local<Value> val) {
        if(val.IsEmpty()) { printf("is empty\n"); }
        if(val->IsFunction()) { printf("it is a function\n"); }
        if(val->IsString()) { printf("it is a string\n"); }
        if(val->IsArray()) {    printf("it is an array\n"); }
        if(val->IsObject()) {   printf("it is an object\n"); }
        if(val->IsBoolean()) {  printf("it is a boolean\n");  }
        if(val->IsNumber()) {  printf("it is a number\n");  }
        if(val->IsExternal()) {  printf("it is external\n");  }
        if(val->IsInt32()) {  printf("it is int32\n");  }
        if(val->IsUint32()) {  printf("it is uint32\n");  }
        if(val->IsDate()) {  printf("it is a date\n");  }
        if(val->IsBooleanObject()) { printf("it is a Boolean Object\n");  }
        if(val->IsNumberObject()) {  printf("it is a Number Object\n");  }
        if(val->IsStringObject()) { printf("it is a String Object\n");  }
        if(val->IsNativeError()) {  printf("it is a Native Error\n");  }
        if(val->IsRegExp()) {  printf("it is a Reg Exp\n");  }
    }
    
    
    static Handle<v8::Value> node_fillQuadColor(const v8::Arguments& args) {
        HandleScope scope;
        GLGFX* self = ObjectWrap::Unwrap<GLGFX>(args.This());
        Local<Value> arg(args[0]);
        
//        printf("filling a quad\n");
        double r = 1;
        double g = 1;
        double b = 1;
        if(args[0]->IsObject()) {
//            printf("opening the color object\n");
            Local<Object> fill = args[0]->ToObject();
            r = fill->Get(String::New("r"))->NumberValue();
            g = fill->Get(String::New("g"))->NumberValue();
            b = fill->Get(String::New("b"))->NumberValue();
//            printf("color = %f %f %f\n",r,g,b);
        }
        
        //v8::String::Utf8Value param1(args[0]->ToString());
        //std::string foo = std::string(*param1);    
        //printf("str %s\n",foo.c_str());
        
        if(args[1]->IsObject()) {
            Local<Object> bnds = args[1]->ToObject();
            Local<Value> w = bnds->Get(String::New("w"));
            //dumpValue(w);
            double dx = bnds->Get(String::New("x"))->NumberValue();
            double dy = bnds->Get(String::New("y"))->NumberValue();
            double dw = bnds->Get(String::New("w"))->NumberValue();
            double dh = bnds->Get(String::New("h"))->NumberValue();
            self->fillQuadColor(r,g,b,new Bounds(dx,dy,dw,dh));
        }

        return scope.Close(Undefined());
    }
    
    static Handle<v8::Value> node_fillQuadText(const v8::Arguments& args) {
        HandleScope scope;
        GLGFX* self = ObjectWrap::Unwrap<GLGFX>(args.This());
        Local<Value> arg(args[0]);
        
        v8::String::Utf8Value param1(args[0]->ToString());
        std::string text = std::string(*param1);    
        char * cstr = new char [text.length()+1];
        std::strcpy (cstr, text.c_str());
        printf("str %s\n",cstr);
        double x = args[1]->ToNumber()->NumberValue();
        double y = args[2]->ToNumber()->NumberValue();
        self->fillQuadText(cstr, x, y);
        return scope.Close(Undefined());
    }
    
    GLfloat* transform;
    std::stack<void*> matrixStack;
    GLGFX() {
        transform = new GLfloat[16];
        make_identity_matrix(transform);
    }
    ~GLGFX() {
    }
    void save() {
        GLfloat* t2 = new GLfloat[16];
        for(int i=0; i<16; i++) {
            t2[i] = transform[i];
        }
        matrixStack.push(transform);
        transform = t2;
    }
    
    void restore() {
        transform = (GLfloat*)matrixStack.top();
        matrixStack.pop();
    }

    void translate(double x, double y) {
        GLfloat tr[16];
        GLfloat trans2[16];
        make_trans_matrix((float)x,(float)y,tr);
        mul_matrix(trans2, transform, tr);
        for (int i = 0; i < 16; i++) transform[i] = trans2[i];
    }
    
    void fillQuadColor(float r, float g, float b, Bounds* bounds) {
        
        float x =  bounds->getX();
        float y =  bounds->getY();
        float x2 = bounds->getX()+bounds->getW();
        float y2 = bounds->getY()+bounds->getH();
        
        //        printf("filling quad color with %f,%f -> %f,%f\n",x,y,x2,y2);
    
        
        GLfloat verts[6][2];
        verts[0][0] = x;
        verts[0][1] = y;
        verts[1][0] = x2;
        verts[1][1] = y;
        verts[2][0] = x2;
        verts[2][1] = y2;
        
        verts[3][0] = x2;
        verts[3][1] = y2;
        verts[4][0] = x;
        verts[4][1] = y2;
        verts[5][0] = x;
        verts[5][1] = y;
        
        GLfloat colors[6][3];
        
        for(int i=0; i<6; i++) {
            for(int j=0; j<3; j++) {
                colors[i][j] = 0.5;
                if(j==0) colors[i][j] = r;
                if(j==1) colors[i][j] = g;
                if(j==2) colors[i][j] = b;
            }
        }
        
        //printf("view = %f, trans = %f\n", modelView[0], transform[0]);
        colorShader->apply(modelView, transform, verts, colors);
    }
    
    void fillQuadText(char* text, double x, double y) {
        fontShader->apply(modelView, transform, text, x, y);
    }
    void scale(double x, double y){
    }
    void rotate(double theta){
    }
private:
};


class NodeCore {
public:
    NodeCore() {
        printf("in the NodeCore constructor\n");
    }
    ~NodeCore() { }
        
    static v8::Persistent<v8::Function> constructor;
private:
};
Persistent<Function> NodeCore::constructor;

