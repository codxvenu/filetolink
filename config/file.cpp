###############              1                 ###########################


#include <iostream>
#include <string>
using namespace  std;

bool present(char a,string b){
     int n = 0;
     for(int i=0;i<b.length();i++){
        if(b[i] == a){
            n++;
        }
     }
    return n ;
}

int main() {
    string a = "papppppppppppppppppppppppppppppppu";
    string b  = "";
    for(int i =0;i<a.length();i++){
        if(!present(a[i],b)){
            b+=a[i];
        }
    }
    for(int i = 0; i<b.length();i++){
        cout << b[i] << endl;
    }
    return 0;
}

###############              2                 ###########################


#include <iostream>
using namespace  std;

bool present(int a,int b[],int len){
     int n = 0;
     for(int i=0;i<len;i++){
        if(b[i] == a){
            n++;
        }
     }
    return n ;
}

int main() {
    int a[10]= {3,4,3,5,5};
    int b[10] ={};
    int n = 0;
    for(int i =0;i<5;i++){
        if(!present(a[i],b,n)){
            b[n]=a[i];
            n++;
        }
    }
    for(int i = 0; i<n;i++){
        cout << b[i] << endl;
    }
    return 0;
}

###############              3                 ###########################




#include <iostream>
#include <string>
using namespace  std;

int main() {
    string a= "hellow how are                u";
    string b= "";
    int n = 0;
    for(int i =0;i<a.length();i++){
        string curr = "";
        curr += a[i];
        if(curr != " "){
            b+=a[i];
        }
    }
    for(int i = 0; i<b.length();i++){
        cout << b[i] << endl;
    }
    return 0;
}

###############              4                 ###########################

#include <iostream>
using namespace  std;

int main() {
    int a = 0;
    int b = 1; 
    cout << (a > b) << endl;
    cout << (a < b) << endl;
    cout << (a == a) << endl;
    cout << (a <= b) << endl;
    cout << (a >= b) << endl;
    cout << (a != b) << endl;
    
    cout << (a == b || b==a) << endl;
    cout << (a != b && b != a) << endl;
    cout << ( !(a > b) && (b > a) )<< endl;

    
    return 0;
}