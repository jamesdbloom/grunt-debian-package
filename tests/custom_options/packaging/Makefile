all: # nothing to build

install:
	mkdir -p $(DESTDIR)/var/www/tasks && cp -a ${current_dir}/tasks/debian_package.js $(DESTDIR)/var/www/tasks/debian_package.js
	mkdir -p $(DESTDIR)/var/www && cp -a ${current_dir}/tests/custom_options/packaging/debian/changelog $(DESTDIR)/var/www/
	mkdir -p $(DESTDIR)/var/www && cp -a ${current_dir}/tests/custom_options/packaging/debian/control $(DESTDIR)/var/www/

