#include <ui/DisplayInfo.h>
#include <ui/FramebufferNativeWindow.h>
#include <gui/SurfaceComposerClient.h>



class Shader {
public:
    Shader();
    virtual int compileVertShader(const char* text);
    virtual int compileFragShader(const char* text);
    virtual int compileProgram(int vert, int frag);
    virtual ~Shader() {}
};

class ColorShader: public Shader {
public:
    ColorShader();
    virtual void apply(GLfloat modelView[16], GLfloat trans[16], GLfloat verts[][2], GLfloat colors[][3]);
    int prog;
    GLint u_matrix, u_trans;
    GLint attr_pos;
    GLint attr_color;    
};

class FontShader: public Shader {
public:
    FontShader();
    virtual void apply(GLfloat modelView[16], GLfloat trans[16], char* text, float x, float y);
    virtual void setFontData(uint8_t* data, int x, int y);
    int prog;
    GLint u_matrix, u_trans;
    GLint attr_pos;
    GLint attr_texcoords, attr_tex, texID;
};

class TextureShader: public Shader {
public:
    TextureShader();
    virtual void apply(GLfloat modelView[16], GLfloat trans[16], GLfloat verts[][2], GLfloat texcoords[][2]);
    int prog;
    GLint u_matrix, u_trans;
    GLint attr_pos;
    GLint attr_texcoords, attr_tex, texID;
};

